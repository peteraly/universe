import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketReturn {
  lastMessage: WebSocketMessage | null
  isConnected: boolean
  error: string | null
  sendMessage: (message: any) => void
  joinJob: (jobId: string) => void
  leaveJob: (jobId: string) => void
}

export const useWebSocket = (serverUrl: string = 'http://localhost:4000'): UseWebSocketReturn => {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const connect = () => {
      try {
        const socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          maxReconnectionAttempts: 5
        })
        
        socketRef.current = socket

        socket.on('connect', () => {
          setIsConnected(true)
          setError(null)
          console.log('WebSocket connected:', socket.id)
        })

        socket.on('disconnect', (reason) => {
          setIsConnected(false)
          console.log('WebSocket disconnected:', reason)
        })

        socket.on('connect_error', (err) => {
          setError(`Connection error: ${err.message}`)
          console.error('WebSocket connection error:', err)
        })

        // Listen for job updates
        socket.on('job-update', (message: WebSocketMessage) => {
          setLastMessage(message)
          console.log('Job update received:', message)
        })

        // Listen for job completion
        socket.on('job-complete', (message: WebSocketMessage) => {
          setLastMessage(message)
          console.log('Job completed:', message)
        })

        // Listen for job errors
        socket.on('job-error', (message: WebSocketMessage) => {
          setLastMessage(message)
          console.error('Job error:', message)
        })

        // Listen for fallback notifications
        socket.on('fallback', (message: WebSocketMessage) => {
          setLastMessage(message)
          console.warn('Fallback used:', message)
        })

      } catch (err) {
        setError('Failed to create WebSocket connection')
        console.error('WebSocket connection error:', err)
      }
    }

    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [serverUrl])

  const joinJob = (jobId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-job', jobId)
      console.log('Joined job room:', jobId)
    }
  }

  const leaveJob = (jobId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-job', jobId)
      console.log('Left job room:', jobId)
    }
  }

  const sendMessage = (message: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', message)
    }
  }

  return {
    lastMessage,
    isConnected,
    error,
    sendMessage,
    joinJob,
    leaveJob,
  }
}
