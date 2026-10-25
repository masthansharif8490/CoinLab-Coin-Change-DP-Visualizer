from django.test import SimpleTestCase

from .dp import min_coins


class CoinChangeTests(SimpleTestCase):
    def test_classic_example(self):
        self.assertEqual(min_coins([1, 2, 5], 11), (3, [5, 5, 1]))

    def test_greedy_fails_case(self):
        # Greedy would pick 4+1+1 (3 coins); DP finds 3+3 (2 coins).
        self.assertEqual(min_coins([1, 3, 4], 6)[0], 2)

    def test_impossible(self):
        self.assertEqual(min_coins([2], 3), (-1, []))

    def test_zero_amount(self):
        self.assertEqual(min_coins([1, 2, 5], 0), (0, []))

    def test_index_page_loads(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "CoinLab")
