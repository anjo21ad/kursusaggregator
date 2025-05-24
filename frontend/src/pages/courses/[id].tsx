import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

type Course = {
  id: number
  title: string
  description: string
  provider: string
}

type Props = {
  course: Course | null
}

export default function CoursePage({ course }: Props) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('Du skal være logget ind for at tilgå dette kursus.')
        router.push('/login')
        return
      }

      const res = await fetch(`/api/has-access?courseId=${course?.id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      setHasAccess(data.access)
    }

    checkAccess()
  }, [course, router])

  if (!course) return <p>Kursus ikke fundet.</p>
  if (hasAccess === null) return <p>Tjekker adgang...</p>
  if (hasAccess === false) return <p>Du har ikke adgang til dette kursus.</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p><em>Udbyder: {course.provider}</em></p>
      <hr />
      <p><strong>Her kunne kursusindholdet ligge… 🎓</strong></p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id)
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      provider: true,
    },
  })

  return {
    props: {
      course,
    },
  }
}
