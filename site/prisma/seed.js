// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 1. Create 4 users
  const users = []
  for (let i = 1; i <= 4; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        walletAddress: `0x${i.toString().padStart(40, '0')}`,
        avatarUrl: `/Avatar/user-${i}.png`,
      },
    })
    users.push(user)
  }

  // 2. Create 4 NFTs, one per user
  const nfts = []
  for (let i = 1; i <= 4; i++) {
    const nft = await prisma.nFT.create({
      data: {
        tokenId: `${100 + i}`,
        contractAddress: '0x000000000000',
        title: `NFT #${i}`,
        imageUrl: `/nftImages/nft-${i}.png`,
        ownerId: users[i - 1].id,
        category: 'Art',        // pick one of your enum values
        width: 420,
        height: 420,
      },
    })
    nfts.push(nft)
  }

  // 3. Create 4 listings, one per NFT
  const listings = []
  for (let i = 0; i < nfts.length; i++) {
    const listing = await prisma.listing.create({
      data: {
        nftId: nfts[i].id,
        sellerId: nfts[i].ownerId,
        price: (i + 1) * 0.5,     // e.g. 0.5, 1.0, 1.5, 2.0
        status: 'ACTIVE',
        description: `Listing for NFT #${i + 1}`,
      },
    })
    listings.push(listing)
  }

  // 4. Create 4 transactions (each NFT sold once)
  for (let i = 0; i < listings.length; i++) {
    // pick a “buyer” that’s not the seller
    const buyer = users[(i + 1) % users.length]
    await prisma.transaction.create({
      data: {
        nftId: nfts[i].id,
        listingId: listings[i].id,
        buyerId: buyer.id,
        sellerId: listings[i].sellerId,
        price: listings[i].price,
      },
    })
  }

  console.log('🌱 Seed data created!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
