import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { LongTextField } from 'uniforms-ionic';

const s = new SimpleSchema({
  title: {
    type: String,
    uniforms: {
      required: true
    }
  },

  description: {
    type: String,
    uniforms: {
      component: LongTextField,
    }
  },

  status: {
    type: String,
    allowedValues: ['OPEN', 'ASSIGNED', 'COMPLETE']
  },

  version: {
    type: Number,
    defaultValue: 1,
    uniforms: {
      readonly: true
    }
  }
});

export const schema = new SimpleSchema2Bridge(s);