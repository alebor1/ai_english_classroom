// supabase/functions/generateLessonTurn/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { sessionId, userMessage } = await req.json();

    // Validate input
    if (!sessionId || !userMessage) {
      return new Response('Missing params', { status: 400 });
    }

    // Create Supabase client with SERVICE_ROLE_KEY
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if session exists and belongs to the authenticated user
    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('lesson_sessions')
      .select('*, lesson_messages(id, role, content, created_at)')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return new Response(sessionError.message ?? 'Server error', { status: 500 });
    }

    // Get user proficiency data from performance_analytics
    const { data: analyticsData, error: analyticsError } = await supabaseClient
      .from('performance_analytics')
      .select('vocabulary_accuracy, grammar_accuracy, pronunciation_score, fluency_score')
      .eq('user_id', sessionData.user_id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get user profile for proficiency level
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('proficiency_level')
      .eq('id', sessionData.user_id)
      .single();

    // Calculate average proficiency metrics
    let userProficiency = {
      proficiency_level: userProfile?.proficiency_level || sessionData.level,
      vocabulary_accuracy: 0.7, // Default values
      grammar_accuracy: 0.7,
      pronunciation_score: 0.7,
      fluency_score: 0.7
    };

    if (analyticsData && analyticsData.length > 0) {
      // Calculate averages from the last 5 sessions
      userProficiency = {
        proficiency_level: userProfile?.proficiency_level || sessionData.level,
        vocabulary_accuracy: analyticsData.reduce((sum, item) => sum + (item.vocabulary_accuracy || 0), 0) / analyticsData.length,
        grammar_accuracy: analyticsData.reduce((sum, item) => sum + (item.grammar_accuracy || 0), 0) / analyticsData.length,
        pronunciation_score: analyticsData.reduce((sum, item) => sum + (item.pronunciation_score || 0), 0) / analyticsData.length,
        fluency_score: analyticsData.reduce((sum, item) => sum + (item.fluency_score || 0), 0) / analyticsData.length
      };
    }

    // Insert user message
    const { error: userMessageError } = await supabaseClient
      .from('lesson_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage,
      });

    if (userMessageError) {
      return new Response(userMessageError.message ?? 'Server error', { status: 500 });
    }

    // Build conversation history for LLM context
    const conversationHistory = sessionData.lesson_messages.map((msg) => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Add the new user message to the history
    conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Prepare system prompt based on lesson topic, level and user proficiency
    const systemPrompt = `
      You are an AI English language tutor helping a student with level ${sessionData.level} English.
      The current topic is: ${sessionData.topic}.
      
      Student proficiency information:
      - Overall proficiency level: ${userProficiency.proficiency_level}
      - Vocabulary accuracy: ${Math.round(userProficiency.vocabulary_accuracy * 100)}%
      - Grammar accuracy: ${Math.round(userProficiency.grammar_accuracy * 100)}%
      - Pronunciation score: ${Math.round(userProficiency.pronunciation_score * 100)}%
      - Fluency score: ${Math.round(userProficiency.fluency_score * 100)}%
      
      Adapt your teaching approach based on this information:
      ${userProficiency.grammar_accuracy < 0.6 ? '- The student struggles with grammar. Provide gentle corrections for grammar mistakes.' : ''}
      ${userProficiency.vocabulary_accuracy < 0.6 ? '- The student has a limited vocabulary. Use simpler words and explain new terms.' : ''}
      ${userProficiency.pronunciation_score < 0.6 ? '- The student needs help with pronunciation. Occasionally provide pronunciation guidance.' : ''}
      ${userProficiency.fluency_score < 0.6 ? '- The student is working on fluency. Encourage longer responses.' : ''}
      
      Your role is to:
      1. Respond to the student in clear, natural English.
      2. Provide corrections for any language mistakes in a friendly, encouraging way.
      3. Use vocabulary and grammar appropriate for their level (${sessionData.level}).
      4. End your response with a relevant follow-up question to continue the conversation.
      5. Keep your responses concise (under 150 words).
      6. Track progress: If the student has had a meaningful exchange (typically 10-20 messages) or has demonstrated sufficient mastery of the topic, include a status flag: "status":"completed" in JSON format at the very end of your message.
      
      Avoid:
      - Lengthy explanations of grammar rules
      - Overwhelming the student with vocabulary beyond their level
      - Using idioms or cultural references that might be confusing
      
      Format your response in a conversational style. Do not label your corrections or follow-up questions explicitly.
    `;

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const openaiData = await openaiResponse.json();
    
    if (!openaiResponse.ok) {
      return new Response(openaiData.error?.message ?? 'Server error', { status: 500 });
    }

    const aiMessage = openaiData.choices[0].message.content;
    
    // Check if the AI indicated that the lesson is completed
    const completionFlag = aiMessage.match(/"status":"completed"/i);
    let status = 'active';
    
    // Clean the message if it contains the completion flag
    let cleanedMessage = aiMessage;
    if (completionFlag) {
      // Remove the status flag from the visible message
      cleanedMessage = aiMessage.replace(/"status":"completed"/i, '').trim();
      status = 'completed';
      
      // Update session status if completed
      await supabaseClient
        .from('lesson_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);
    }

    // Insert AI message
    const { error: aiMessageError } = await supabaseClient
      .from('lesson_messages')
      .insert({
        session_id: sessionId,
        role: 'ai',
        content: cleanedMessage,
      });

    if (aiMessageError) {
      return new Response(aiMessageError.message ?? 'Server error', { status: 500 });
    }

    // Return the AI message along with session status
    return new Response(JSON.stringify({ aiMessage: cleanedMessage }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(err.message ?? 'Server error', { status: 500 });
  }
});