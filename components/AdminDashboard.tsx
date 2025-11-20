'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlbumUpload } from '@/components/AlbumUpload'
import { AlbumList } from '@/components/AlbumList'
import { Plus } from 'lucide-react'

export function AdminDashboard() {
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setShowUpload(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Albums</h2>
        <Button onClick={() => setShowUpload(!showUpload)} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          {showUpload ? 'Cancel' : 'Create Album'}
        </Button>
      </div>

      {showUpload && (
        <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Create New Album</CardTitle>
          </CardHeader>
          <CardContent>
            <AlbumUpload onSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      )}

      <AlbumList key={refreshKey} />
    </div>
  )
}

