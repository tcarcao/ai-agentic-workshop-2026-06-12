# Ember

Ember is a food-delivery app: customers browse restaurants, build a cart, and place orders the kitchen fulfils. This file is the ubiquitous language — one name per concept, used the same way in code, docs, tests, and conversation.

## Language

### Catalog

**Restaurant**:
A place customers order from; owns a menu and its delivery terms (fee, time, rating).
_Avoid_: store, vendor, merchant

**Menu item**:
A single orderable dish on a restaurant's menu.
_Avoid_: product, SKU, dish (in code)

**Dietary tag**:
A label on a menu item ("vegetarian", "vegan", "gluten-free") that customers filter and decide by.
_Avoid_: allergen label, badge

### Ordering

**Cart**:
The customer's in-progress selection, held only in the browser; it becomes an Order at checkout.
_Avoid_: basket, bag

**Order**:
A customer's confirmed purchase, immutable once placed. An order is priced by the kitchen's menu, never by the cart that proposed it.
_Avoid_: purchase, transaction, checkout (as a noun)

**Order line**:
One menu item and a quantity inside an order, with the name and unit price captured at placement time.
_Avoid_: item (ambiguous with menu item), cart row, entry

**Customer**:
The free-text name on an order — who the food is for. A customer is not an account; guests are customers too.
_Avoid_: user (that's an account), client, buyer

**Total**:
The server-computed sum of an order's lines.
_Avoid_: price (that's per item), amount

### Accounts

**User**:
An authenticated account (email + password). An order *may* belong to a user; nobody needs one to order.
_Avoid_: customer (the name on an order), account, member

**Guest**:
A customer with no user attached; their order history lives only in their own browser.
_Avoid_: anonymous user, visitor

**Confirmation**:
The email-ownership proof step between signup and first login, completed with a confirmation code.
_Avoid_: verification, activation

**Claim**:
Attaching a guest's past orders to their user after login, so history follows the account.
_Avoid_: merge, import, link

**Session**:
A user's signed-in state with the API.
_Avoid_: token, login (as a noun)

### Cross-app language

**Contract**:
The request/response shapes both apps agree on — defined once, imported by both sides. If the contract doesn't say it, it doesn't cross.
_Avoid_: DTOs, API types, interfaces (generic)

**Seam**:
The FE↔BE boundary where the contract is exchanged — the place mismatches hide and the first place to look when something silently fails.
_Avoid_: integration point, boundary (generic)

**Cents**:
All money is integer euro cents end to end; it becomes a formatted string only at the moment of display.
_Avoid_: floats, decimal euros
