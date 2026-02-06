import Image from "next/image";

export const Header = () => {
  return (
    <header className="top-0 left-0 z-50 bg-background shadow-sm">
      <div className="mx-auto px-4 py-2 flex items-center justify-center">
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