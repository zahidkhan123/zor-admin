const IMAGE_BASE_URL = 'http://localhost:3000/api/v1/getFile?key='
// const IMAGE_BASE_URL = 'https://zor-development.onrender.com/api/v1/getFile?key='
export const fetchSignedUrl = async (key) => {
  try {
    const res = await fetch(`${IMAGE_BASE_URL}${key}`)
    const json = await res.json()
    console.log(json.data.signedUrl)
    return json?.data?.signedUrl || ''
  } catch (error) {
    console.error('Failed to fetch signed URL:', error)
    return ''
  }
}

export const fetchMultipleSignedUrls = async (keys = []) => {
  try {
    const urls = await Promise.all(keys.filter(Boolean).map(fetchSignedUrl))
    return urls.filter(Boolean)
  } catch (error) {
    console.error('Error fetching multiple signed URLs:', error)
    return []
  }
}

export default { fetchSignedUrl, fetchMultipleSignedUrls }
