import React from 'react';
import {AutoForm, AutoFields, SubmitField, ErrorsField} from 'uniforms-ionic';
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
          
          <SubmitField />
      </AutoForm>
  )
}