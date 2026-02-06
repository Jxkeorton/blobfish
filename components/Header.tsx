import Image from "next/image";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-screen z-50 bg-white dark:bg-black shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-center">
        <Image
          src="/BlobfishPink.png"
          alt="Blobfish logo"
          width={150}
          height={150}
        />
      </div>
    </header>
  )
}