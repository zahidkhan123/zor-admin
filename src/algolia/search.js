import client from './algolia__client.js'

export const search = async (query, indexName, categoryId) => {
  try {
    // make categoryId optional
    const filters = categoryId ? `category.$oid:${categoryId}` : undefined
    const { results } = await client.search({
      requests: [
        {
          indexName,
          query: query,
          filters: filters,
        },
      ],
    })
    if ('hits' in results[0]) {
      console.log(categoryId, query, 'results', results[0].hits.length)
      return results[0].hits
    }
  } catch (error) {
    console.error('Error searching records:', error)
  }
}

// search('Do');
