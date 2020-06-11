import gql from "graphql-tag"

export const CommentExpandedFragment = gql`
  fragment CommentExpandedFields on Comment {
   id
   message
   version
   author
   note {
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
   }
} 
`
