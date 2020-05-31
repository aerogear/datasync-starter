import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { LongTextField } from "uniforms-ionic";

const s = new SimpleSchema({
  title: {
    type: String,
    uniforms: {
      required: true,
    },
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
  },

  type: {
    type: String,
    allowedValues: ["External", "ByAppointment", "Remote"]
  },

  priority: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5],
  },
}) as any;

export const schema = new SimpleSchema2Bridge(s);
