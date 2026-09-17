export function getProfileAvatar(profileId) {
  const value = String(profileId || 'partner')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)
  const avatarNumber = (value % 70) + 1

  return `https://i.pravatar.cc/240?img=${avatarNumber}`
}
