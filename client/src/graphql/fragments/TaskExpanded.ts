import gql from "graphql-tag"

export const TaskExpandedFragment = gql`
  fragment TaskExpandedFields on Task {
   id
   title
   description
   test
   test2
   status
   version

} 
`
