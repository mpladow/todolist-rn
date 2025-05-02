import { Image, StyleSheet, Platform, FlatList, View, Pressable } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTodosQuery } from '../api';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { TodoDto } from '@/models/todosDto';
import { TodoForm } from '@/models/todoForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTodo } from '../api/api';

export default function HomeScreen() {
  const [title, setTitle] = useState('');
  const { data, isFetching, error } = useTodosQuery();
  const queryClient = useQueryClient();

  const handleAddNew = () => {
    console.log(title);
    const newTodo: TodoForm = {
      title: title,
    };
    mutate(newTodo);
  };

  const { mutate } = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      console.log('IS SUCCESS');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.log(error, 'ERROR');
    },
  });

  const handlePressCheckbox = () => {};
  if (isFetching) {
    return (
      <View style={{ backgroundColor: 'pink' }}>
        <ThemedText>Fetching...</ThemedText>
      </View>
    );
  }
  return (
    <ThemedView>
      <ThemedText>ToDoList</ThemedText>

      {error ? (
        <View style={{ backgroundColor: 'pink' }}>
          <ThemedText>Unable to retrieve data</ThemedText>
        </View>
      ) : (
        <ThemedView>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={{ padding: 4, borderWidth: 1, borderColor: 'white', color: 'white' }}
              value={title}
              onChangeText={(val) => setTitle(val)}
            />
            <Pressable onPress={handleAddNew} style={[{ width: 60, height: 20, padding: 4 }]}>
              <ThemedText>Add</ThemedText>
            </Pressable>
          </View>
          <FlatList
            contentContainerStyle={{ height: 500 }}
            data={data}
            ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
            scrollEnabled
            renderItem={({ item, index }) => {
              return (
                <View style={{ padding: 4, flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable
                    onPress={handlePressCheckbox}
                    style={[
                      item.completedAt
                        ? { backgroundColor: 'blue' }
                        : { backgroundColor: 'transparent', borderWidth: 2, borderColor: 'blue', borderRadius: 4 },
                      { width: 20, height: 20 },
                      { marginRight: 4 },
                    ]}
                  />
                  <ThemedText>{item.title}</ThemedText>
                </View>
              );
            }}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
