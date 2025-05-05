import { Image, StyleSheet, Platform, FlatList, View, Pressable, Dimensions, Text, ScrollView, TextInput } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { TodoDto } from '@/models/todosDto';
import { TodoForm } from '@/models/todoForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTodo, completeTodo, fetchAllTodos, FilterType, openTodo } from '@/api/api';
import { useTodosQuery } from '@/api';
import { todoQueryOptions } from '@/api/queries/Todos/todoQueryOptions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  // hooks
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all' as FilterType);
  const queryClient = useQueryClient();

  const { data, isFetching, error, refetch } = useTodosQuery('all');

  useEffect(() => {
    refetch();
  }, []);

  const { mutate } = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      console.log('IS SUCCESS');
    },
    onMutate: async (newTodo: TodoDto) => {
      let x = await queryClient.ensureQueryData({ queryKey: ['todos', filter] });
      console.log('🚀 ~ onMutate: ~ x:', x);
      await queryClient.cancelQueries({ queryKey: ['todos', filter] });
      console.log('🚀 ~ onMutate: ~ queryClient:', queryClient);

      const previous = queryClient.getQueryData(['todos', filter]);
      console.log('🚀 ~ onMutate: ~ previous:', previous);

      // Optimistically update to the new value
      queryClient.setQueryData(['todos', filter], (old: TodoDto[]) => {
        console.log('🚀 ~ queryClient.setQueryData ~ old:', old);
        return [...old, newTodo];
      });
      // Return a context object with the snapshotted value
      // return { previous };
    },
    onError: (error) => {
      console.log(error, 'ERROR');
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', filter] });
    },
  });

  const { mutate: completionMutation } = useMutation({
    mutationFn: completeTodo,
    onSuccess: () => {
      console.log('IS SUCCESS');
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos', filter] });

      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos', filter]);
      console.log('🚀 ~ onMutate: ~ previous:', previous);

      const todoToUpdate = previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        const newObj = { ...todoToUpdate, completedAt: new Date() };
        queryClient.setQueryData(['todos', filter], (old: TodoDto[]) => {
          console.log('🚀 ~ queryClient.setQueryData ~ old:', old);
          return [...old, newObj];
        });
        console.log('🚀 ~ onMutate: ~ newObj:', newObj);
        // Return a context object with the snapshotted value
        return { previous };
      }
      // Optimistically update to the new value
    },
    onError: (error) => {
      console.log(error, 'ERROR');
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', filter] });
    },
  });

  const { mutate: openTodoMutation } = useMutation({
    mutationFn: openTodo,
    onSuccess: () => {
      console.log('IS SUCCESS');
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos', filter] });

      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos', filter]);
      console.log('🚀 ~ onMutate: ~ previous:', previous);

      const todoToUpdate = previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        const newObj = { ...todoToUpdate, completedAt: null };
        queryClient.setQueryData(['todos', filter], (old: TodoDto[]) => {
          console.log('🚀 ~ queryClient.setQueryData ~ old:', old);
          return [...old, newObj];
        });
        console.log('🚀 ~ onMutate: ~ newObj:', newObj);
        // Return a context object with the snapshotted value
        return { previous };
      }
      // Optimistically update to the new value
    },
    onError: (error) => {
      console.log(error, 'ERROR');
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', filter] });
    },
  });
  // handlers
  const handleAddNew = () => {
    console.log(title);
    const newTodo: TodoForm = {
      title: title,
    };
    mutate(newTodo);
  };

  const handlePressCheckbox = (id: number) => {
    const foundItem = data?.find((x) => x.todoId === id);
    if (foundItem?.completedAt) {
      openTodoMutation(id);
    } else {
      completionMutation(id);
    }
  };
  //   if (isFetching) {
  //     return (
  //       <View style={{ backgroundColor: 'pink' }}>
  //         <ThemedText>Fetching...</ThemedText>
  //       </View>
  //     );
  //   }
  const { height } = Dimensions.get('window');
  const { bottom, top } = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: bottom, marginTop: top }]}>
      <Text>ToDo List</Text>
      <FlatList
        data={data}
        contentContainerStyle={{ height: Dimensions.get('screen').height - 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        scrollEnabled
        renderItem={({ item, index }) => {
          return (
            <View style={{ padding: 4, flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => handlePressCheckbox(item.todoId ?? 0)}
                style={[
                  item.completedAt
                    ? { backgroundColor: 'blue' }
                    : { backgroundColor: 'transparent', borderWidth: 2, borderColor: 'blue', borderRadius: 4 },
                  { width: 20, height: 20 },
                  { marginRight: 4 },
                ]}
              />
              <Text>{item.title}</Text>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4, backgroundColor: 'blue' }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{ padding: 4, borderWidth: 1, borderColor: 'white', color: 'white' }}
            value={title}
            onChangeText={(val) => setTitle(val)}
          />
        </View>
        <View>
          <Pressable onPress={handleAddNew} style={[{ width: 60, padding: 4 }]}>
            <Text>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: Dimensions.get('screen').height - 200,
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
