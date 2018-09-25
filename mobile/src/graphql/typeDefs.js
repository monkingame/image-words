
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

#type ImageSizeType{
#  width:Int!
#  height:Int!
#}

type InputOssTokenType{
  accessKeyId:String
  accessKeySecret:String
  stsToken:String
  region:String
  bucket:String
  secure:Boolean
}

type GlobalStatus{
  visibleModalListWords:Boolean
}
`;



