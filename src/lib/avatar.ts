// Avatar generation utilities using DiceBear API
// https://www.dicebear.com/

export type AvatarStyle =
  | 'adventurer'
  | 'adventurer-neutral'
  | 'avataaars'
  | 'avataaars-neutral'
  | 'big-ears'
  | 'big-ears-neutral'
  | 'big-smile'
  | 'bottts'
  | 'bottts-neutral'
  | 'croodles'
  | 'croodles-neutral'
  | 'fun-emoji'
  | 'icons'
  | 'identicon'
  | 'initials'
  | 'lorelei'
  | 'lorelei-neutral'
  | 'micah'
  | 'miniavs'
  | 'notionists'
  | 'notionists-neutral'
  | 'open-peeps'
  | 'personas'
  | 'pixel-art'
  | 'pixel-art-neutral'
  | 'rings'
  | 'shapes'
  | 'thumbs'

// Default avatar styles that work well for professional profiles
export const PROFESSIONAL_AVATAR_STYLES: AvatarStyle[] = [
  'avataaars',
  'avataaars-neutral',
  'adventurer',
  'adventurer-neutral',
  'big-ears-neutral',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'notionists',
  'notionists-neutral',
  'personas'
]

// Generate a random seed for deterministic but unique avatars
export function generateAvatarSeed(userId?: string, email?: string): string {
  if (userId) {
    return userId
  }

  if (email) {
    return email
  }

  // Generate a random seed based on current timestamp and random number
  return `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Generate DiceBear avatar URL
export function generateAvatarUrl(
  seed: string,
  style: AvatarStyle = 'avataaars',
  size: number = 128
): string {
  const baseUrl = 'https://api.dicebear.com/9.x'
  const format = 'svg' // SVG is recommended for better quality and smaller size

  // Add some randomization options for more variety
  const options = new URLSearchParams({
    seed,
    backgroundColor: 'b6e3f4,c0aede,d1d4f9,fde68a,fed7aa', // Light professional colors
    backgroundType: 'gradientLinear',
    ...(size !== 128 && { size: size.toString() })
  })

  return `${baseUrl}/${style}/${format}?${options.toString()}`
}

// Generate a random professional avatar
export function generateRandomProfessionalAvatar(
  seed?: string,
  size: number = 128
): string {
  const randomStyle = PROFESSIONAL_AVATAR_STYLES[
    Math.floor(Math.random() * PROFESSIONAL_AVATAR_STYLES.length)
  ]

  const avatarSeed = seed || generateAvatarSeed()

  return generateAvatarUrl(avatarSeed, randomStyle, size)
}

// Generate avatar for specific user
export function generateUserAvatar(
  userId: string,
  email?: string,
  size: number = 128
): string {
  // Use userId as primary seed for consistency, fallback to email
  const seed = userId || email || generateAvatarSeed()

  // Use a deterministic but varied style selection based on the seed
  const seedNumber = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const styleIndex = seedNumber % PROFESSIONAL_AVATAR_STYLES.length
  const style = PROFESSIONAL_AVATAR_STYLES[styleIndex]

  return generateAvatarUrl(seed, style, size)
}

// Check if URL is already a DiceBear avatar
export function isDiceBearAvatar(url: string): boolean {
  return url.includes('api.dicebear.com') || url.includes('dicebear')
}

// Get avatar URL with fallback to generated avatar
export function getAvatarUrl(
  userImageUrl?: string | null,
  userId?: string,
  email?: string,
  size: number = 128
): string {
  // If user has a custom profile image, use it
  if (userImageUrl && !isDiceBearAvatar(userImageUrl)) {
    return userImageUrl
  }

  // If user has a DiceBear avatar already, use it
  if (userImageUrl && isDiceBearAvatar(userImageUrl)) {
    return userImageUrl
  }

  // Generate new avatar for user
  return generateUserAvatar(userId || email || '', email, size)
}

// Update user avatar in the database
export async function updateUserAvatarInDatabase(
  userId: string,
  avatarUrl: string,
  supabaseClient: any // We'll import the proper type later
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseClient
      .from('users')
      .update({ profile_image_url: avatarUrl })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}