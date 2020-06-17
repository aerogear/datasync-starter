import React from 'react';
import {AutoForm, AutoFields, HiddenField, SubmitField, ErrorsField} from 'uniforms-ionic';
import {schema} from './schema';

export function TaskForm({model, handleSubmit}) {
  return (
      <AutoForm 
        schema={schema} 
        onSubmit={handleSubmit} 
        model={model}
      >
          <ErrorsField />
          <AutoFields />
          <HiddenField name="version" value={model.version ?? 1} />
          <SubmitField />
      </AutoForm>
  )
}