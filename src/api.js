export async function getQuestion(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch question')
  }
  return response.json()
}

export async function sendAnswer(url, answer) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer })
  })

  if (!response.ok) {
    throw new Error('Wrong answer')
  }

  return response.json()
}
