const mongoose = require('mongoose');

const { Schema } = mongoose;

const InterviewQuestionSchema = new Schema(
  {
    questionId: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const InterviewAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true, trim: true },
    questionText: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    mimeType: { type: String, trim: true },
    transcript: { type: String, default: null },
    processingError: { type: String, default: null },
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendation: {
      type: String,
      enum: ['pass', 'needs_review', 'fail'],
      default: 'needs_review',
    },
    evaluationSource: {
      type: String,
      enum: ['ai', 'manual_review'],
      default: 'manual_review',
    },
  },
  { timestamps: true }
);

const InterviewSessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skill: { type: String, required: true, trim: true },
    skillRef: { type: Schema.Types.ObjectId, ref: 'Skill', default: null },
    job: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    proposal: { type: Schema.Types.ObjectId, ref: 'Proposal', default: null },
    status: {
      type: String,
      enum: ['started', 'in_progress', 'completed', 'failed'],
      default: 'started',
      index: true,
    },
    questions: { type: [InterviewQuestionSchema], default: [] },
    answers: { type: [InterviewAnswerSchema], default: [] },
    finalScore: { type: Number, min: 0, max: 100, default: null },
    finalRecommendation: {
      type: String,
      enum: ['pass', 'needs_review', 'fail'],
      default: null,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'pass', 'fail'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

InterviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports =
  mongoose.models.InterviewSession ||
  mongoose.model('InterviewSession', InterviewSessionSchema);
