import unittest
from app.utils.fraud_detection import detect_fraud

class TestFraudDetection(unittest.TestCase):
    def test_detect_fraud(self):
        """
        Tests that the detect_fraud function takes a list of transactions and
        returns the same list with an additional 'is_fraud' key in each
        transaction dictionary.

        The test case checks that the length of the output list is the same as
        the input list, and that the 'is_fraud' key is present in the first
        transaction dictionary.
        """
        transactions = [
            {'amount': 100, 'timestamp': 1630000000},
            {'amount': 1000, 'timestamp': 1630000100}
        ]
        result = detect_fraud(transactions)
        self.assertEqual(len(result), 2)
        self.assertIn('is_fraud', result[0])

if __name__ == '__main__':
    unittest.main()