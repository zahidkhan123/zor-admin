import { algoliasearch } from 'algoliasearch'

// define keys
const appID = 'CL3H9EJ1JQ'
const apiKey = 'e5b33602d8f727ff611ea3dff8bd408e'

// Initialize the Algolia client
const client = algoliasearch(appID, apiKey)

// Initialize the index
// const index = client.initIndex(indexName);

export default client
