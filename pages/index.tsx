import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { prisma } from '../lib/prisma'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Layout from "../components/Layout"
interface FormData {
  name: string
  country: string
  id: string
}

// Array interface
interface Assemblies {
  assemblies: {
    id: string
    name: string
    country: string
  }[]
}

// Load assemblies from getServerSideProps server side rendering
const Home: NextPage<Assemblies> = ({ assemblies }) => {
  const [form, setForm] = useState<FormData>({name: '', content: '', id: ''})
  const [newAssembly, setNewAssembly] = useState<Boolean>(true)
  const router = useRouter()

  const refreshData = () => {
    router.replace(router.asPath)
  }

  async function handleSubmit(data: FormData) {
    // console.log(data)
    // console.log(newAssembly)

    try {
      if (newAssembly) {
        // Check input is not blank
        if (data.name) {
          // CREATE
          fetch('api/assembly/create', {
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST'
          }).then(() => {
            setForm({name: '', country: '', id: ''})
            refreshData()
          })
        }
        else {
          alert("Title can not be blank")
        }
      }
      else {
        // UPDATE
          fetch(`api/assembly/${data.id}`, {
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'PUT'
          }).then(() => {
            setForm({name: '', country: '', id: ''})
            setNewAssembly(true)
            refreshData()
          })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function updateAssembly(name, country, id) {
    //console.log(name, country, id)
    setForm({name, country, id})
    setNewAssembly(false)
  }

  async function deleteAssembly(id: string) {
    try {
      fetch(`api/assembly/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE'
      }).then(() => {
        refreshData()
      })
    } catch (error) {
      console.log(error)
    }    
  }

  function handleCancel() {
    setForm({name: '', country: '', id: ''})
    setNewAssembly(true)
  }

  return (
    <Layout>
      <Head>
        <title>Assemblies</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <h1 className="text-center font-bold text-2xl m-4">Assemblies</h1>
      <form className="w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch" 
        onSubmit={e => {
          e.preventDefault()
          handleSubmit(form)
      }}>
        <input type="text" 
          placeholder="Title" 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})}
          className="border-2 rounded border-gray-600 p-1"
        />
        <textarea placeholder="Content" 
          value={form.country} 
          onChange={e => setForm({...form, country: e.target.value})} 
          className="border-2 rounded border-gray-600 p-1"
        />
        {newAssembly ? (
          <button type="submit" className="bg-blue-500 text-white rounded p-1">Add +</button>
        ) : (
          <>
            <button type="submit" className="bg-blue-500 text-white rounded p-1">Update</button>
            <button onClick={handleCancel} className="bg-red-500 text-white rounded p-1">Cancel</button>
          </>
        )}
      </form>

      <div className="w-auto min-w-[25%] max-w-min mt-10 mx-auto space-y-6 flex flex-col items-stretch">
        <h2 className="text-center font-bold text-xl mt-4">Saved Assemblies</h2>
        <ul>
          {assemblies.map(assembly => (
            <li key={assembly.id} className="border-b border-gray-600 p-2">
              <div className="flex jusify-between">
                <div className="flex-1">
                  <h3 className="font-bold">{assembly.name}</h3>
                  <p className="text-sm">{assembly.country}</p>
                </div>
                <button onClick={() => updateAssembly(assembly.name, assembly.country, assembly.id)} className="bg-blue-500 px-3 text-white rounded">Edit</button>
                <button onClick={() => deleteAssembly(assembly.id)} className="bg-red-500 px-3 text-white rounded">X</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

export default Home

// Server side rendering on every request
export const getServerSideProps: GetServerSideProps = async () => {
  // READ all assemblies from DB
  const assemblies = await prisma?.assembly.findMany({
    select: {
      name: true,
      id: true,
      country: true
    }
  })

  return {
    props: {
      assemblies
    }
  }
}