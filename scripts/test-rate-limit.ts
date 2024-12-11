async function testRateLimit(url: string, attempts: number) {
    console.log(`Testing rate limit for ${url}`)
    for (let i = 0; i < attempts; i++) {
      const response = await fetch(url)
      const remaining = response.headers.get('X-RateLimit-Remaining')
      console.log(`Attempt ${i + 1}: Status ${response.status}, Remaining: ${remaining}`)
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait 100ms between requests
    }
    console.log('\n')
  }
  
  async function runTests() {
const baseUrl = 'http://localhost:3002/api'
    await testRateLimit(`${baseUrl}/hello`, 25)
    await testRateLimit(`${baseUrl}/users`, 25)
    await testRateLimit(`${baseUrl}/products`, 25)
  }
  
  runTests().catch(console.error)
  
  