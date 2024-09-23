import React from 'react'
import Image from 'next/image'
import doc from '../assets/file.png'

const FileCard = ({name, handleClick}) => {
  return (
    <div className="justify-center items-center w-[130px] text-center px-[25px] py-[20px] hover:bg-[#2682ec] bg-[#02356e] hover:border-[#5f5f5f] cursor-pointer rounded-[15px] hover:scale-105 transition duration-500 ease-in-out transform" onClick={handleClick}>
        <Image src={doc} height={90} width={90} alt='file'/>
        <h3 className="font-poppins mt-[10px] font-bold text-[18px] text-white leading-[26px] truncate">
          {name}
        </h3>
    </div>
  )
}

export default FileCard