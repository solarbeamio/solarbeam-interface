# Solarbeam.io
Solarbeam DEX on Moonriver

### Whitelisting

Make a Pull Request to this repo including:
 - Add token's png under the *public/images/tokens* folder
 - Add token's info in the *src/constants/token-lists/solarbeam.tokenlist.json* file, in this format:
   ```
   {
       "name": [token_name],
       "address": [token_address],
       "symbol": [token_symbol],
       "decimals": 18,
       "chainId": 1285,
       "logoURI": "https://solarbeam.io/images/tokens/[token_png_filename]"
   }
   ```
   