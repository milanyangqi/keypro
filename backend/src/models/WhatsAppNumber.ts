import mongoose, { Schema, Document } from 'mongoose';

// WhatsApp号码接口
export interface IWhatsAppNumber extends Document {
  number: string;
  industry: string;
  uploader: mongoose.Types.ObjectId;
  uploadTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

// WhatsApp号码模式
const WhatsAppNumberSchema: Schema = new Schema({
  number: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  uploader: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadTime: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'whatsapp_numbers',
  timestamps: true
});

// 创建索引，提高查询性能
WhatsAppNumberSchema.index({ uploadTime: 1 });
WhatsAppNumberSchema.index({ uploader: 1 });
WhatsAppNumberSchema.index({ industry: 1 });

// 导出WhatsApp号码模型
export default mongoose.model<IWhatsAppNumber>('WhatsAppNumber', WhatsAppNumberSchema);
