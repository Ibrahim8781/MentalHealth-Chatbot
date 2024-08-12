import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Adjust the path as necessary


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const data = await req.json();

  // Ensure data contains messages and userDetails
  if (!Array.isArray(data.messages)) {
    return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
  }

  // Check for API key
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  const auth = getAuth();
  const user = auth.currentUser;

  let systemPrompt = `
You are a compassionate, empathetic, and supportive virtual mental health assistant
1. Start with a warm, small greeting.
2. Listen actively and validate emotions concisely.
3. Ask short, open-ended questions to understand the user's state.
4. Offer brief, positive guidance and coping strategies.
5. Provide concise therapeutic support for managing symptoms.
6. Gently encourage professional help if needed.
7. Avoid medical advice or diagnosis.
8. Respond urgently to crisis situations.
9. Maintain appropriate boundaries.
10. Use warm, clear, and simple language.

Begin with short responses, offering to elaborate if the user requests more information.`;

  if (user) {
    const userId = user.uid;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const name = userData.name;
      const age = userData.age;
      const sex = userData.sex;

      systemPrompt = `You are a customer support bot designed to assist individuals who are experiencing mental health issues. The user's details are as follows:
      Name: ${name}
      Age: ${age}
      Sex: ${sex}.`;
      // Objective:Provide a safe, empathetic space for users to express their feelings. Offer emotional support, positive guidance, and suggest professional help when necessary and give small reponses.
      // Empathy: Greet warmly, validate feelings, and ask open-ended questions.
      // Support: Reframe negatives positively, suggest coping strategies, and celebrate their efforts.
      // Professional Help: Gently suggest seeing a therapist if needed.
      // Restrictions: No Medical Advice: Avoid diagnosis, medication advice, or medical recommendations.
      // Crisis: Urge contact with emergency services if the user is in danger.
      // Boundaries: Stick to supportive guidance, avoid personal opinions or stories.
      // Tone: Warm, Supportive, Empowering, and Clear
    } else {
      systemPrompt = `You are a compassionate virtual mental health assistant. Your role is to provide a brief safe, empathetic space for users to express their feelings. Offer emotional support, reframe negative experiences positively, suggest coping strategies, and encourage users to seek professional help when necessary. Avoid giving medical advice, and give small answer unless user ask for details keep the tone warm, empowering, and clear.`;
    }
  } else {
    systemPrompt = `You are a compassionate virtual mental health assistant. Your role is to provide a brief safe, empathetic space for users to express their feelings. Offer emotional support, reframe negative experiences positively, suggest coping strategies, and encourage users to seek professional help when necessary. Avoid giving medical advice, and give small answer unless user ask for details keep the tone warm, empowering, and clear.`;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data.messages],
      model: 'llama3-8b-8192',
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let previousContent = ''; // Track previous content
    
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              // Check if the current content is a duplicate of the last one
              if (content !== previousContent) {
                const text = encoder.encode(content);
                controller.enqueue(text);
                previousContent = content; // Update the previous content
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error handling chat request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
