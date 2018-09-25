

export const typeDefs = `
type LoginedUser {
  id:ID!
  username:String!
  token:String!
}

type SearchStatus{
  inSearch:Boolean!
  keyword:String
}

type ImageSizeType{
  width:Int!
  height:Int!
}

`;

// type ListImages{
//   images:[ImageType!]!
//   cursor:String!
// }

// type ImageType{
//   id:ID!
//   filename:String!
//   authorid:ID!
//   vote:Int
//   deleted:Boolean
//   createdAt:DateTime
//   updatedAt:DateTime
//   signedUrl:String
// }

// type Query{
//   paginationImages: [ImageType]
// }

// type Mutation {
//   addLocalPaginationImages(image: ImageType!): ImageType
// }
