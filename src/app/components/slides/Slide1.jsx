import Link from 'next/link';
import Image from 'next/image';

const Slide1 = ({ title, description, imageUrl, buttons }) => {
  return (
    <div className="relative h-[50vh] w-full flex items-center justify-center">
      <Image
        src={imageUrl}
        alt="Background"
        fill
        priority
        className="object-cover z-[-1]"
      />
      <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#3a5729]">
          {title}
        </h1>
        <p className="text-xl text-gray-600">
          {description}
        </p>
        <div className="space-x-4">
          {buttons.map((button, index) => (
            <Link key={index} href={button.href}>
              <button
                className={`px-8 py-3 rounded-lg transition-colors ${
                  button.variant === 'primary'
                    ? 'bg-[#798f38] text-white hover:bg-opacity-90'
                    : 'border-2 border-[#404c1b] text-[#8ca345] hover:bg-[#566528] hover:text-white'
                }`}
              >
                {button.text}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slide1;