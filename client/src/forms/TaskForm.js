import React from 'react';
import {AutoForm} from 'uniforms-ionic';
import {schema} from './schema';

export function TaskForm({model, handleSubmit}) {
  return (
      <AutoForm 
        schema={schema} 
        onSubmit={handleSubmit} 
        model={model}
      >
          {/* You can also place fields explicitly */}
          {/* <ErrorsField />
          <TextField name="title" />
          <LongTextField name="description" />
          <HiddenField name="status" value="OPEN" />
          <HiddenField name="version" value={model.version ?? 1} />
          <SubmitField /> */}
      </AutoForm>
  )
}