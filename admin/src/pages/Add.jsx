import React, { useEffect, useMemo, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useLocation, useParams, useNavigate  } from 'react-router-dom'

const Add = ({ token }) => {
  const { id: editId } = useParams()
  const location = useLocation()
  const navigate = useNavigate() 
  const productFromState = location.state?.product

  // images can be either File or URL string (when editing)
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Men')
  const [subCategory, setSubCategory] = useState('Topwear')
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])

  const isEdit = Boolean(editId)

  // helper: preview whether File or URL
  const previewSrc = (img) => {
    if (!img) return assets.upload_area
    if (typeof img === 'string') return img
    return URL.createObjectURL(img)
  }

  // preload if we got product in navigation state
  useEffect(() => {
    const p = productFromState
    if (isEdit && p) {
      setName(p.name || '')
      setDescription(p.description || '')
      setPrice(p.price || '')
      setCategory(p.category || 'Men')
      setSubCategory(p.subCategory || 'Topwear')
      setBestseller(!!p.bestseller)
      setSizes(p.sizes || [])
      // set existing image URLs so they render; user can replace any
      setImage1(p.image?.[0] || false)
      setImage2(p.image?.[1] || false)
      setImage3(p.image?.[2] || false)
      setImage4(p.image?.[3] || false)
    }
  }, [isEdit, productFromState])

  // OPTIONAL: if user refreshed / opened link directly, fetch single product by id
  useEffect(() => {
    const fetchOne = async () => {
      if (isEdit && !productFromState) {
        try {
          // implement this endpoint in backend if not present
          const res = await axios.get(`${backendUrl}/api/product/single/${editId}`)
          if (res.data.success) {
            const p = res.data.product
            setName(p.name || '')
            setDescription(p.description || '')
            setPrice(p.price || '')
            setCategory(p.category || 'Men')
            setSubCategory(p.subCategory || 'Topwear')
            setBestseller(!!p.bestseller)
            setSizes(p.sizes || [])
            setImage1(p.image?.[0] || false)
            setImage2(p.image?.[1] || false)
            setImage3(p.image?.[2] || false)
            setImage4(p.image?.[3] || false)
          } else {
            toast.error(res.data.message || 'Failed to load product')
          }
        } catch (err) {
          // if you don’t have the endpoint yet, this will just log
          console.log(err)
        }
      }
    }
    fetchOne()
  }, [isEdit, editId, productFromState])

  const resetForm = () => {
    setName('')
    setDescription('')
    setImage1(false)
    setImage2(false)
    setImage3(false)
    setImage4(false)
    setPrice('')
    setCategory('Men')
    setSubCategory('Topwear')
    setBestseller(false)
    setSizes([])
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      if (isEdit) formData.append('id', editId)

      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes))

      // If image state is a File, append; if it's a URL string (unchanged), skip
      if (image1 && typeof image1 !== 'string') formData.append('image1', image1)
      if (image2 && typeof image2 !== 'string') formData.append('image2', image2)
      if (image3 && typeof image3 !== 'string') formData.append('image3', image3)
      if (image4 && typeof image4 !== 'string') formData.append('image4', image4)

      const url = isEdit
        ? `${backendUrl}/api/product/update`
        : `${backendUrl}/api/product/add`

      const response = await axios.post(url, formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        resetForm()
        if (isEdit) navigate('/list')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          <label htmlFor='image1'>
            <img className='w-20' src={previewSrc(image1)} alt='' />
            <input onChange={(e)=>setImage1(e.target.files[0])} type='file' id='image1' hidden/>
          </label>
          <label htmlFor='image2'>
            <img className='w-20' src={previewSrc(image2)} alt='' />
            <input onChange={(e)=>setImage2(e.target.files[0])} type='file' id='image2' hidden/>
          </label>
          <label htmlFor='image3'>
            <img className='w-20' src={previewSrc(image3)} alt='' />
            <input onChange={(e)=>setImage3(e.target.files[0])} type='file' id='image3' hidden/>
          </label>
          <label htmlFor='image4'>
            <img className='w-20' src={previewSrc(image4)} alt='' />
            <input onChange={(e)=>setImage4(e.target.files[0])} type='file' id='image4' hidden/>
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Type here' required/>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' placeholder='Write content here' required/>
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
            <option value='Men'>Men</option>
            <option value='Women'>Women</option>
            <option value='Kids'>Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select onChange={(e)=>setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
            <option value='Topwear'>Topwear</option>
            <option value='Bottomwear'>Bottomwear</option>
            <option value='Winterwear'>Winterwear</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type='number' placeholder='25' />
        </div>
      </div>

      <div>
        <p className='mb-2'>Product Sizes</p>
        <div className='flex gap-3'>
          {['S','M','L','XL','XXL'].map(sz => (
            <div key={sz} onClick={() =>
              setSizes(prev => prev.includes(sz) ? prev.filter(x=>x!==sz) : [...prev, sz])
            }>
              <p className={`${sizes.includes(sz) ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>{sz}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type='checkbox' id='bestseller' />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to bestseller</label>
      </div>

      <button type='submit' className='w-28 py-3 mt-4 bg-black text-white'>
        {isEdit ? 'UPDATE' : 'ADD'}
      </button>
    </form>
  )
}

export default Add