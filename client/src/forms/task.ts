import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { LongTextField } from "uniforms-ionic";

export const taskForm = {
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

export const taskView = {
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
    uniforms: {
      readonly: true
    }
  },

  startDate: {
    type: Date,
    defaultValue: new Date(),
  },

  public: {
    type: Boolean
  },

  type: {
    type: String,
    allowedValues: ["External", "ByAppointment", "Remote"],
    uniforms: {
      readonly: true
    }
  },

  priority: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5],
    uniforms: {
      readonly: true
    }
  },
} as any


const schemaEdit = new SimpleSchema(taskForm)
export const taskEditSchema = new SimpleSchema2Bridge(schemaEdit);

const schemaView = new SimpleSchema(taskForm)
export const taskViewSchema = new SimpleSchema2Bridge(schemaView);
