import gql from "graphql-tag"

export const TaskExpandedFragment = gql`
  fragment TaskExpandedFields on Task {
   id
   title
   description
   version
   status
   type
   priority
   public
   startDate
   payload
   comments {
      id
      message
      version
      author
   }
} 
`
