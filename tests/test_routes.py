import unittest
from app import create_app

class TestRoutes(unittest.TestCase):
    def setUp(self):
        """
        Set up the test client and application context.

        This method initializes the Flask application using `create_app()` and
        creates a test client for sending HTTP requests to the application.
        """
        self.app = create_app()
        self.client = self.app.test_client()
    
    def test_index(self):
        """
        Tests that the index page returns a 200 status code and contains the string 'Welcome' in the response body.
        """
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome', response.data)

if __name__ == '__main__':
    unittest.main()