// AI Feedback API - Track user interactions with AI recommendations
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { interactionId, feedbackType, courseId, rating } = req.body;

    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    if (!interactionId || !feedbackType) {
      return res.status(400).json({
        error: 'interactionId and feedbackType are required'
      });
    }

    // Verify interaction belongs to user
    const interaction = await prisma.aIInteraction.findUnique({
      where: { id: interactionId },
    });

    if (!interaction || interaction.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update interaction based on feedback type
    const updateData: any = {};

    switch (feedbackType) {
      case 'click':
        if (!courseId) {
          return res.status(400).json({ error: 'courseId required for click feedback' });
        }
        updateData.clickedCourseId = courseId;
        break;

      case 'booking':
        if (!courseId) {
          return res.status(400).json({ error: 'courseId required for booking feedback' });
        }
        updateData.bookedCourseId = courseId;
        break;

      case 'rating':
        if (rating === undefined || rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'rating must be between 1 and 5' });
        }
        updateData.feedbackRating = rating;
        break;

      default:
        return res.status(400).json({ error: 'Invalid feedbackType' });
    }

    // Update the interaction
    const updatedInteraction = await prisma.aIInteraction.update({
      where: { id: interactionId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      interaction: updatedInteraction,
    });

  } catch (error) {
    console.error('Feedback API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
