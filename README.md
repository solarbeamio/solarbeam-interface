# Solarbeam.io
Solarbeam DEX on Moonriver

### Whitelisting

Make a Pull Request to this repo including:
 - Add token's icon (.png) under the *public/images/tokens* folder
 - Add token's info in the *src/constants/token-lists/solarbeam.tokenlist.json* file, in this format:
   ```
   {
       "name": [token_name],
       "address": [token_address],
       "symbol": [token_symbol],
       "decimals": [token_decimals],
       "chainId": 1285,
       "logoURI": "https://solarbeam.io/images/tokens/[token_icon_filename]"
   }
   ```
   
<br>

More info about pull requests:
 - [Creating a pull request from a fork](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)