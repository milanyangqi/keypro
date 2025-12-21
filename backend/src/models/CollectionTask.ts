import mongoose, { Schema, Document } from 'mongoose';

// 采集任务状态枚举
export enum CollectionTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  FAILED = 'failed'
}

// 采集配置接口
interface CollectionConfig {
  regions: string[];
  keywords: string[];
  sources: string[];
  pages: number;
  delay?: number;
}

// 采集进度接口
interface CollectionProgress {
  currentPage: number;
  totalPages: number;
  collectedNumbers: number;
  processedSources: number;
  totalSources: number;
}

// 结果统计接口
interface ResultStats {
  success: number;
  failed: number;
  duplicate: number;
  total: number;
}

// 采集任务接口
export interface ICollectionTask extends Document {
  name?: string;
  description?: string;
  config: CollectionConfig;
  status: CollectionTaskStatus;
  progress: CollectionProgress;
  stats: ResultStats;
  creator: mongoose.Types.ObjectId;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  logs: string[];
}

// 采集任务模式
const CollectionTaskSchema: Schema = new Schema({
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  config: {
    regions: {
      type: [String],
      required: true
    },
    keywords: {
      type: [String],
      required: true
    },
    sources: {
      type: [String],
      required: true
    },
    pages: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    delay: {
      type: Number,
      default: 1000,
      min: 500,
      max: 10000
    }
  },
  status: {
    type: String,
    enum: Object.values(CollectionTaskStatus),
    default: CollectionTaskStatus.PENDING,
    index: true
  },
  progress: {
    currentPage: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      default: 0
    },
    collectedNumbers: {
      type: Number,
      default: 0
    },
    processedSources: {
      type: Number,
      default: 0
    },
    totalSources: {
      type: Number,
      default: 0
    }
  },
  stats: {
    success: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    duplicate: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  creator: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  logs: {
    type: [String],
    default: []
  }
}, {
  collection: 'collection_tasks',
  timestamps: true
});

// 创建索引，提高查询性能
CollectionTaskSchema.index({ creator: 1, status: 1 });
CollectionTaskSchema.index({ createdAt: -1 });
CollectionTaskSchema.index({ startedAt: -1 });
CollectionTaskSchema.index({ completedAt: -1 });

// 导出采集任务模型
export default mongoose.model<ICollectionTask>('CollectionTask', CollectionTaskSchema);
