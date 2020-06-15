import { SimpleSchema2Bridge } from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { LongTextField } from "uniforms-ionic";

const taskForm = {
  title: {
    type: String
  },
  description: {
    type: String,
    uniforms: {
      component: LongTextField,
    },
  },

  status: {
    type: String,
    defaultValue: "OPEN",
    allowedValues: ["OPEN", "ASSIGNED", "COMPLETE"],
  },

  startDate: {
    type: Date,
    defaultValue: new Date()
  },

  public: {
    type: Boolean,
    required: false
  },

  type: {
    type: String,
    allowedValues: ["External", "ByAppointment", "Remote"],
    required: false
  },

  priority: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5],
    required: false
  },
} as any

const taskView = {
  title: {
    type: String,
    uniforms: {
      readonly: true
    }
  },
  description: {
    type: String,
    uniforms: {
      component: LongTextField,
      readonly: true
    },
  },
  status: {
    type: String,
    defaultValue: "OPEN",
    allowedValues: ["OPEN", "ASSIGNED", "COMPLETE"],
    required: false,
    uniforms: {
      readonly: true
    }
  },

  startDate: {
    type: Date,
    required: false,
    defaultValue: new Date(),
    uniforms: {
      readonly: true
    }
  },

  public: {
    required: false,
    type: Boolean,
    uniforms: {
      readonly: true
    }
  },

  type: {
    type: String,
    allowedValues: ["External", "ByAppointment", "Remote"],
    required: false,
    uniforms: {
      readonly: true
    }
  },

  priority: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5],
    required: false,
    uniforms: {
      readonly: true
    }
  },

  comments: {
    type: Array,
    required: false
  },

  'comments.$': {
    type: Object,
    uniforms: {
      readonly: true
    }
  },

  'comments.$.message': {
    type: String,
    uniforms: {
      component: LongTextField,
      readonly: true
    }
  }
} as any


const commentForm = {
  message: {
    type: String,
    uniforms: {
      component: LongTextField,
    }
  },
  author: {
    type: String,
    uniforms: {
      readonly: true
    }
  }
} as any

const schemaEdit = new SimpleSchema(taskForm)
export const taskEditSchema = new SimpleSchema2Bridge(schemaEdit);

const schemaView = new SimpleSchema(taskView)
export const taskViewSchema = new SimpleSchema2Bridge(schemaView);

const commentEdit = new SimpleSchema(commentForm)
export const commentViewSchema = new SimpleSchema2Bridge(commentEdit);