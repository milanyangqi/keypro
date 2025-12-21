import mongoose, { Schema, Document } from 'mongoose';

interface IEmail extends Document {
  email: string;
  industry: string;
  keyword?: string;
  syntax?: string;
  platform?: string;
  uploader: mongoose.Types.ObjectId;
  uploadTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true,
  },
  keyword: {
    type: String,
    trim: true,
  },
  syntax: {
    type: String,
    trim: true,
  },
  platform: {
    type: String,
    trim: true,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadTime: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// 创建索引以提高查询性能
EmailSchema.index({ uploadTime: -1 });
EmailSchema.index({ uploader: 1 });
EmailSchema.index({ industry: 1 });

const Email = mongoose.model<IEmail>('Email', EmailSchema);

export default Email;
