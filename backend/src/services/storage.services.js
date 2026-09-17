const ImageKit = require('imagekit');

let imageKit = null;

function getImageKit() {
  if (imageKit) return imageKit;

  const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    const error = new Error('Image upload is not configured. Set the IMAGEKIT_* environment variables.');
    error.status = 500;
    throw error;
  }

  imageKit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });

  return imageKit;
}

async function uploadFile(file, fileName) {
  return getImageKit().upload({ file, fileName });
}

module.exports = { uploadFile };
