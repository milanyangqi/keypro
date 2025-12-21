import mongoose, { Schema, Document } from 'mongoose';

interface IEmail extends Document {
  email: string;
  industry: string;
  keyword?: string;
  syntax?: string;
  platform?: string;
  uploader: mongoose.Types.ObjectId;
  uploadTime: Date;
  exported: boolean;
  exportTime?: Date;
  taskId?: mongoose.Types.ObjectId;
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
  exported: {
    type: Boolean,
    default: false,
    index: true
  },
  exportTime: {
    type: Date
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionTask',
    index: true
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
