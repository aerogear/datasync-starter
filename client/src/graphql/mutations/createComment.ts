import gql from "graphql-tag"
import { CommentFragment } from "../fragments/Comment"

export const createComment = gql`
  mutation createComment($input: CommentInput!) {
  createComment(input: $input) {
      ...CommentFields
  }
}


  ${CommentFragment}
`
