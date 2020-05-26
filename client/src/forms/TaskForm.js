import React from 'react';
import {AutoForm, TextField, LongTextField, HiddenField, SubmitField, ErrorsField} from 'uniforms-ionic';
import {schema} from './schema';

export function TaskForm({model, handleSubmit}) {
  return (
      <AutoForm 
        schema={schema} 
        onSubmit={handleSubmit} 
        model={model}
      >
          <ErrorsField />
          <TextField name="title" />
          <LongTextField name="description" />
          <HiddenField name="status" value="OPEN" />
          <HiddenField name="version" value={model.version ?? 1} />
          <SubmitField />
      </AutoForm>
  )
}