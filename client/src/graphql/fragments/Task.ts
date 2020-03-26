import gql from "graphql-tag"

export const TaskFragment = gql`
  fragment TaskFields on Task {
   id
   title
   description
   test
   test2
   status
   version

} 
`
