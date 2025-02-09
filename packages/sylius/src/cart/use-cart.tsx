import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useCart, { UseCart } from '@vercel/commerce/cart/use-cart'
import { getCartToken } from '../utils/token/cart-token'
import { normalizeCart } from '../utils/normalize/normalize-cart'
import { GetCartHook } from '@vercel/commerce/types/cart'
import { CUSTOMER_ORDERS_ENDPOINT } from '../utils/constant/api-endpoints'

export default useCart as UseCart<typeof handler>

export const handler: SWRHook<GetCartHook> = {
  fetchOptions: {
    url: CUSTOMER_ORDERS_ENDPOINT,
    method: 'GET',
  },
  fetcher: async ({ options, fetch }) => {
    const cartToken = getCartToken()
    if (cartToken) {
      const syliusCart = await fetch({
        url: `${options.url}/${cartToken}`,
        method: options.method,
      })
      return normalizeCart(syliusCart)
    }
    return null
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })
      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.lineItems.length ?? 0) <= 0
              },
              enumerable: true,
            },
          }),
        [response]
      )
    },
}
