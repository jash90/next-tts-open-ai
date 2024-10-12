'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Volume2 } from "lucide-react"

export default function TTSPage() {
  const [inputText, setInputText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)

  const removeExtraWhitespaces = (text: string): string => {
    return text.replace(/\s{2,}/g, ' ')
  }

  const sendTextForTTS = async (text: string, chunkIndex: number): Promise<ArrayBuffer | undefined> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1',
          input: text,
          voice: 'alloy',
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      )
      console.log(`Chunk ${chunkIndex} audio generated`)
      return response.data
    } catch (error) {
      console.error('Error generating speech:', error)
    }
  }

  const splitTextAndProcess = async (): Promise<void> => {
    setProgress(0)
    if (!inputText) return

    setIsProcessing(true)
    const data = removeExtraWhitespaces(inputText)

    const chunkSize = 4000
    let chunkCount = 0
    let currentIndex = 0
    const audioBuffers: Blob[] = []

    while (currentIndex < data.length) {
      let endIndex = currentIndex + chunkSize

      if (endIndex < data.length) {
        const periodIndex = data.lastIndexOf('.', endIndex)
        if (periodIndex > currentIndex) {
          endIndex = periodIndex + 1
        } else {
          const nextPeriodIndex = data.indexOf('.', endIndex)
          if (nextPeriodIndex === -1 || nextPeriodIndex - currentIndex > chunkSize) {
            console.error('Error: Sentence exceeds chunk size limit of 4000 characters.')
            setIsProcessing(false)
            return
          }
          endIndex = nextPeriodIndex + 1
        }
      }

      const chunk = data.slice(currentIndex, endIndex).trim()
      const audioData = await sendTextForTTS(chunk, chunkCount)
      if (audioData) {
        const audioBlob = new Blob([audioData], { type: 'audio/mp3' })
        audioBuffers.push(audioBlob)
      }
      chunkCount++
      currentIndex = endIndex

      setProgress(Math.min(100, Math.floor((currentIndex / data.length) * 100)))
    }

    const mergedAudioBlob = await mergeAudioFiles(audioBuffers)
    if (mergedAudioBlob) {
      const audioUrl = URL.createObjectURL(new Blob([mergedAudioBlob], { type: 'audio/wav' }))
      setAudioUrl(audioUrl)
    }
    setIsProcessing(false)
    setProgress(100)
  }

  const mergeAudioFiles = async (audioBuffers: Blob[]): Promise<Blob | undefined> => {
    try {
      const audioContext = new window.AudioContext()
      const buffers = await Promise.all(
        audioBuffers.map(async (audioBlob) => {
          const arrayBuffer = await audioBlob.arrayBuffer()
          return await audioContext.decodeAudioData(arrayBuffer)
        })
      )

      const outputBuffer = audioContext.createBuffer(
        buffers[0].numberOfChannels,
        buffers.reduce((sum, buffer) => sum + buffer.length, 0),
        buffers[0].sampleRate
      )

      let offset = 0
      buffers.forEach((buffer) => {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          outputBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset)
        }
        offset += buffer.length
      })

      return await bufferToWavBlob(outputBuffer)
    } catch (error) {
      console.error('Error merging audio files:', error)
    }
  }

  const bufferToWavBlob = async (buffer: AudioBuffer): Promise<Blob> => {
    const numberOfChannels = buffer.numberOfChannels
    const length = buffer.length * numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)

    let offset = 0
    const writeString = (str: string): void => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset, str.charCodeAt(i))
        offset++
      }
    }

    writeString('RIFF')
    view.setUint32(offset, length - 8, true)
    offset += 4
    writeString('WAVE')
    writeString('fmt ')
    view.setUint32(offset, 16, true)
    offset += 4
    view.setUint16(offset, 1, true)
    offset += 2
    view.setUint16(offset, numberOfChannels, true)
    offset += 2
    view.setUint32(offset, buffer.sampleRate, true)
    offset += 4
    view.setUint32(offset, buffer.sampleRate * numberOfChannels * 2, true)
    offset += 4
    view.setUint16(offset, numberOfChannels * 2, true)
    offset += 2
    view.setUint16(offset, 16, true)
    offset += 2
    writeString('data')
    view.setUint32(offset, length - 44, true)
    offset += 4

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Text-to-Speech Converter</CardTitle>
          <p className="text-center text-muted-foreground">
            {"Convert your text into natural-sounding speech using OpenAI's advanced TTS technology"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here"
            className="min-h-[200px]"
          />
          <Input
            type="text"
            placeholder="Enter your OpenAI API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="text-center mb-2">
            <a
              href="https://www.youtube.com/watch?v=muaHr3oYf7U"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              How to Create an OpenAI Account & Generate an API Key in Minutes
            </a>
          </div>
          <Button
            onClick={splitTextAndProcess}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Convert Text to Speech
              </>
            )}
          </Button>
          {isProcessing && (
            <Progress value={progress} className="w-full" />
          )}
          {audioUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Output Audio:</h3>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}