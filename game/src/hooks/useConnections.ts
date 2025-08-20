import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Connection } from '../types'
import { useAuth } from '../contexts/AuthContext'

export const useConnections = () => {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setConnections([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'connections'),
      where('userAId', '==', user.id)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const connectionData: Connection[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        connectionData.push({
          userAId: data.userAId,
          userBId: data.userBId,
          createdAt: data.createdAt.toDate(),
        })
      })
      setConnections(connectionData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  return { connections, loading }
}

