import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

function ImageGallery({ backdrops = [], posters = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('backdrops');

  const images = activeTab === 'backdrops' ? backdrops : posters;

  const openLightbox = (image, index) => {
    setSelectedImage({ ...image, index });
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    if (selectedImage && selectedImage.index > 0) {
      setSelectedImage({ ...images[selectedImage.index - 1], index: selectedImage.index - 1 });
    }
  };

  const goToNext = () => {
    if (selectedImage && selectedImage.index < images.length - 1) {
      setSelectedImage({ ...images[selectedImage.index + 1], index: selectedImage.index + 1 });
    }
  };

  if (backdrops.length === 0 && posters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hình ảnh</h2>
        
        {/* Tabs */}
        <div className="flex gap-2">
          {backdrops.length > 0 && (
            <button
              onClick={() => setActiveTab('backdrops')}
              className={`px-4 py-2 rounded transition-all ${
                activeTab === 'backdrops'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Backdrop ({backdrops.length})
            </button>
          )}
          {posters.length > 0 && (
            <button
              onClick={() => setActiveTab('posters')}
              className={`px-4 py-2 rounded transition-all ${
                activeTab === 'posters'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Poster ({posters.length})
            </button>
          )}
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => openLightbox(image, index)}
            className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-red-600 transition-all"
          >
            <img
              src={image.urls.w780 || image.urls.w342 || image.urls.original}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {image.width} × {image.height}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {selectedImage.index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 p-3 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-all z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {selectedImage.index < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 p-3 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-all z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-7xl max-h-full"
          >
            <img
              src={selectedImage.urls.original}
              alt={`Full size ${selectedImage.index + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="text-center mt-4 text-gray-300">
              <p className="text-sm">
                {selectedImage.width} × {selectedImage.height} • {selectedImage.type}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedImage.index + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
